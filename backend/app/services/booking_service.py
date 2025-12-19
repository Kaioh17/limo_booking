import math
from app.db.db_connection import get_supa_db
from supabase import client
from fastapi import Depends, HTTPException
from app.core.deps import get_current_user
from app.utils.logging import logger
from app.utils.db_error_handling import DBErrorHandler
from . import helper_service, email_service
import datetime as dt
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo

class BookingService:
    TABLE = "bookings"
    USER_TABLE ='users'
    response = helper_service.JsonResponse
    def __init__(self, supa, current_user):
        self.supa = supa
        self.current_user = current_user
    def _to_user_time_zone(self, dt_utc: datetime, user_tz: str = "America/Chicago"):
        if type(dt_utc) == str:
            dt_utc = datetime.fromisoformat(dt_utc)
        # logger.debug(f"datetime:{dt_utc} as {type(dt_utc)}")
        tz = dt_utc.astimezone(ZoneInfo(user_tz))
        # logger.debug(f"User timezone {tz} for {user_tz}")
        return tz
    def _to_local_time(self, data):
        try:
            # logger.debug(f"data type: {type(data)}")
            
            if type(data) == dict:
                for k, v in data.items():
                    if k == "dropoff_time" or k == "pickup_time":
                        data[k] = self._to_user_time_zone(dt_utc = v)
            elif type(data) == list:
                for dict_ in data:
                    # logger.debug(dict_)
                    for k, v in dict_.items():
                        if k == "dropoff_time" or k == "pickup_time":
                            dict_[k] = self._to_user_time_zone(dt_utc = v)
            return data
        except Exception as e:
            raise e
    def request_book(self, payload):
        # creates book ride
        try:
            
            data = payload.model_dump(exclude={"pickup_time, dropoff_time"})
            data.pop("users", None)
            data.pop("pickup_location_coordinates", None)
            data.pop("dropoff_location_coordinates", None)
            
            logger.debug(f"{str(payload.pickup_time), str(payload.dropoff_time)}")
            if payload.users:    
                email = payload.users.email
                first_name = payload.users.first_name
                last_name = payload.users.last_name
                phone = payload.users.phone

                logger.debug("verifying user user email {}".format(email))

                users = helper_service.UserUtils(self.supa).user_exist(email)
                logger.debug("verifying user complete {}".format(email))
            
            if len(users) != 0:
                logger.debug("Getting id because exist {}".format(users))
 
                id = users[0]['id']
                logger.debug("Getting id because exist {}".format(id))
            else:
                logger.debug("Creating user to db since empty : {}".format(email))

                query = self.supa.table(self.USER_TABLE).insert({'first_name': first_name, 'last_name': last_name, 'email': email, 'role': 'rider', 'phone': phone}).execute()  #user gets created if not in table
                id = query.data[0]["id"]
            logger.debug('data passed {}'.format(data))
            
            if data["service_type"] == 'drop-off' or data["service_type"] == 'airport-service':
                
                ##calculate price 
                distance=self._distance_in_miles(dropoff_coord=payload.dropoff_location_coordinates,
                                        pickup_coord=payload.pickup_location_coordinates)
                duration = (distance / 45) * 3600
                start_time = data["pickup_time"]
                logger.debug(f"start_time {start_time}")
                start_time = self._to_user_time_zone(start_time)
                # logger.debug(start_time)
                # est_time = duration + start_time.timestamp()
                # logger.debug(f"duration {duration} est time {est_time} for {distance} miles")
                total_price=self.calculate_total_price(distance=distance) #total price
                # dt_est_time = dt.datetime.fromtimestamp(est_time)
                dt_est_time = start_time + timedelta(seconds =duration)
                payload.dropoff_time = dt_est_time
                dropoff_tz = self._to_user_time_zone(dt_est_time)
                logger.debug(f"ETA (duration: {duration}) time: {data["dropoff_time"]} tz:{dropoff_tz} start_time: {start_time}")
                
                logger.debug(f'total price: {total_price}')
            else:
                logger.debug("Hourly service")
                total_price = round(100 * data['hours'], 2)
                logger.debug(f"Total price for {data['hours']} hour(s): {total_price}")
            logger.debug(f"start_time: {payload.pickup_time} \n drop_off: {payload.dropoff_time}")
            query = self.supa.table(self.TABLE).insert({**data, "pickup_time":str(payload.pickup_time),\
                                                         "dropoff_time":str(payload.dropoff_time),"total_price": total_price, "user_id": id}).execute()
            select=self.supa.table(self.TABLE).select('*, users(*)')\
                .eq('id', query.data[0]['id']).execute()
            
            logger.debug("{}".format(select.data[0]))

            booking_data = select.data[0]
            # """Email notification"""
            # notify = email_service.BookingEmails(email=booking_data['users']['email'])
            # notify.new_ride(booking_data)
            # notify.admin(booking_data)
            # logger.debug(f"Previous dropoff {booking_data['dropoff_time']} pickup {booking_data['pickup_time']}")

            
            booking_data = self._to_local_time(data=booking_data)
            
            logger.debug(f"new dropoff {booking_data['dropoff_time']} pickup {booking_data['pickup_time']}")

            return self.response.success_response("success", booking_data)
        except Exception as e:
            logger.error(f"Error creating booking: {e}")
            DBErrorHandler.handle_supabase(e, "Creating bookingtist")
            raise e
        
    def approve_price(self, booking_id, is_approved: bool = False):
        try:
            logger.debug('Approving booking...')
            
            self.supa.table(self.TABLE).update({'is_approved': is_approved}).eq('id', booking_id).execute()
            if is_approved == False: 
                logger.debug("ride not approved")
                return {'is_approved': is_approved}

            select=self.supa.table(self.TABLE).select('*, users(*)')\
                .eq('id', booking_id).execute()
            
            logger.debug("{}".format(select.data[0]))

            booking_data = select.data[0]
            booking_data = self._to_local_time(data=booking_data)
            """Email notification"""
            notify = email_service.BookingEmails(email=booking_data['users']['email'])
            notify.new_ride(booking_data)
            notify.admin(booking_data)
            
            
            logger.debug('ride approved')
            
            # return self.response.success_response(message="successfully updated", data = {'is_approved': True})
            return {'is_approved': is_approved}
        except Exception as e:
            logger.error(f"Error creating booking: {e}")
            DBErrorHandler.handle_supabase(e, "Creating bookingtist")
            raise e
    def _distance_in_miles(self, dropoff_coord, pickup_coord):
        # based on distance
        logger.debug(f'Coordinates: {dropoff_coord}, {pickup_coord}')
        lon1 = math.radians(dropoff_coord.lon)
        lon2 = math.radians(pickup_coord.lon)
        lat1 = math.radians(dropoff_coord.lat)
        lat2 = math.radians(pickup_coord.lat)
        
        #differences
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        #haversine formula
        a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
        c = 2 * math.asin(math.sqrt(a))

        
        R = 3958.8 #earth radius in miles
        distance = R*c
        logger.info(f"latdiffernce{dlat} and londiffernce{dlon}---->c = {c} distance {distance}")
        return distance
    def calculate_total_price(self, distance):
        total_price =round(distance * 25, 2)
        return total_price
    def get_book(self, id: str = None):
        try:

            if id:
                # user_id = self.current_user['id']
                
                query = self.supa.table(self.TABLE).select("*, users(*)").eq('id', id).order('created_at', desc = True).execute()
                booking_data = query.data[0]
                
            else:
                helper_service.ValidateUser(supa=self.supa)._ensure_admin(current_user=self.current_user)
                
                # logger.debug("I am in here")
                query = self.supa.table(self.TABLE).select("*, users(*)").order('created_at', desc = True).execute()
                booking_data = query.data


            if not booking_data: 
                logger.error('No bookings in system')
                
                raise HTTPException(status_code=404, detail="No bookings in system")
            booking_data = self._to_local_time(data=booking_data)
            return self.response.success_response('Successfully fetched booking', booking_data)
        except Exception as e:
            logger.error(f"Error getting booking: {e}")
            # DBErrorHandler.handle_supabase(e, "Creating bookingtist")
            raise e
    def get_all_bookings(self, booking_id = None):
        
        try:
            role = self.current_user['role']
            if booking_id:
                # logger.debug(f"I am in here looking for {booking_id}")
                
                query = self.supa.table(self.TABLE).select("*, users(*)").eq('id', booking_id).order('created_at', desc = True).execute()
                booking_data = query.data
                
                if booking_data == []:
                    logger.debug("There is no bookings at this id")
                    raise HTTPException(status_code=404, detail="There is no bookings at this id")
                booking_data = booking_data[0]
                
            elif role == "rider":
                query = self.supa.table(self.TABLE).select("*, users(*)").eq('user_id', self.current_user['id']).order('created_at', desc = True).execute()
                booking_data = query.data
                
                if booking_data == []:
                    logger.debug("There is no bookings at this id")
                    raise HTTPException(status_code=404, detail="There is no bookings at this id")    
                
            else: 
                # logger.debug("I am in here")
                helper_service.ValidateUser(self.supa)._ensure_admin(current_user=self.current_user)
                query = self.supa.table(self.TABLE).select("*, users(*)").order('created_at', desc = True).execute()
                booking_data = query.data
                
            booking_data = self._to_local_time(data=booking_data)
            # logger.debug(f"{booking_data}")
            return self.response.success_response('Successfully fetched booking', booking_data)
        except Exception as e:
            logger.error(f"Error getting booking: {e}")
            DBErrorHandler.handle_supabase(e, "Getting all booking")
            raise e
def get_booking_service(supa: client = Depends(get_supa_db)):
    return BookingService(supa, None)

    
def get_authorized_booking_service(supa: client = Depends(get_supa_db), current_user = Depends(get_current_user)):
    return BookingService(supa, current_user)
    