import resend
from app.config import Settings
from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import EmailStr


settings = Settings()
resend.api_key = settings.resend_api_key
from_email = "Acme <noreply@resend.dev>"
class AdminEmail:
    """Admin notifications"""
    
    def __init__(self, email:EmailStr):
        self.email = 'mubskill@gmail.com'
    
    def notify_new_password(self, name: str):
        return resend.Emails.send({
            "from": from_email,
            "to": self.email,
            "subject": "Password Updated Successfully",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; margin-bottom: 20px;">Password Updated Successfully</h2>
                
                <p>Dear {name},</p>
                
                <p style="font-size: 16px; color: #2d5016; background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <strong>Your password has been successfully updated.</strong>
                </p>
                
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Security Notice</strong></p>
                    <p style="margin: 5px 0 0 0;">If you did not make this change, please contact support immediately to secure your account.</p>
                </div>
                
                <p>If you have any questions or concerns, please don't hesitate to reach out to our support team.</p>
                
                <p style="font-size: 12px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #666;">
                    This is an automated email. Please do not reply directly to this message.
                </p>
            </div>
            """})
        
class OTP:
    """
    sending one time password 
    """

    # from_email = from_email

    def __init__(self, email):
        self.email = email
    
    def one_time_password(self, token):
        if token < 99999: #99999
            token = f"0{token}"
            print(token)
        return resend.Emails.send({
            "from": from_email,
            "to": "mubskill@gmail.com",
            "subject": "Your Verification Code",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; margin-bottom: 20px;">Email Verification Code</h2>
                
                <p>Thank you for signing up! Please use the verification code below to complete your account setup.</p>
                
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Your verification code is:</p>
                    <p style="margin: 0; font-size: 32px; font-weight: bold; color: #333; letter-spacing: 5px;">{token}</p>
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Important:</strong></p>
                    <p style="margin: 5px 0 0 0;">This code will expire in 5 minutes. Please enter it promptly to verify your email address.</p>
                </div>
                
                <p>If you did not request this code, please ignore this email.</p>
                
                <p style="font-size: 12px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #666;">
                    This is an automated email. Please do not reply directly to this message.
                </p>
            </div>
            """})
    
class DriverEmail:
    """
    notify artists
    """

    from_email = "Acme <noreply@resend.dev>"

    def __init__(self, email):
        self.email = email
    
    def new_ride(self, booking):
        # Format pickup date and time
        pickup_time_str = str(booking['pickup_time'])
        if pickup_time_str.endswith('Z'):
            pickup_datetime = datetime.fromisoformat(pickup_time_str.replace('Z', '+00:00'))
        else:
            pickup_datetime = datetime.fromisoformat(pickup_time_str)
        
        pickup_date = pickup_datetime.strftime('%B %d, %Y')
        pickup_time = pickup_datetime.strftime('%I:%M %p')
        
        return resend.Emails.send({
            "from": self.from_email,
            "to": self.email,
            "subject": f"New Ride Assignment - {pickup_date}",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; margin-bottom: 20px;">New Ride Assignment</h2>
                
                <p style="font-size: 16px; color: #1565c0; background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <strong>You have been assigned a new ride. Please review the details below.</strong>
                </p>
                
                <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Ride Details</h3>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p><strong>Customer Name:</strong><br/>{booking['users']['first_name']} {booking['users']['last_name']}</p>
                    <p style="margin-top: 10px;"><strong>Contact:</strong><br/>{booking['users']['phone']} | {booking['users']['email']}</p>
                    <p style="margin-top: 10px;"><strong>Pickup Location:</strong><br/>{booking['pickup_location']}</p>
                    <p style="margin-top: 10px;"><strong>Pickup Date & Time:</strong><br/>{pickup_date} at {pickup_time}</p>
                    
                    {f"<p style='margin-top: 10px;'><strong>Dropoff Location:</strong><br/>{booking['dropoff_location']}</p>" if booking.get('dropoff_location') else ""}
                    
                    <p style="margin-top: 10px;"><strong>Service Type:</strong><br/>{booking['service_type'].replace('-', ' ').replace('_', ' ').title()}</p>
                    
                    {f"<p style='margin-top: 10px;'><strong>Duration:</strong><br/>{booking['hours']} {'hour' if booking['hours'] == 1 else 'hours'}</p>" if booking.get('hours') else ""}
                    
                    {f"<p style='margin-top: 10px;'><strong>Special Notes:</strong><br/>{booking['notes']}</p>" if booking.get('notes') else ""}
                </div>
                
                <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Action Required</h3>
                <ul style="line-height: 1.8;">
                    <li>Confirm vehicle readiness</li>
                    <li>Arrive 5-10 minutes before scheduled pickup time</li>
                    <li>Contact customer if there are any delays</li>
                    <li>Update ride status in the system</li>
                </ul>
                
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Important:</strong></p>
                    <p style="margin: 5px 0 0 0;">Please check your dashboard for complete booking details and any updates.</p>
                </div>
                
                <p style="font-size: 12px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #666;">
                    This is an automated email. Please do not reply directly to this message.<br/>
                    Booking ID: {booking.get('id', 'N/A')}
                </p>
            </div>
            """})

import os
from dotenv import load_dotenv
load_dotenv()
base_url = os.getenv("base_url")
class BookingEmails:
    """
    notify users
    """

    from_email = "Acme <noreply@resend.dev>"

    def __init__(self, email):
        self.email = email
    
    def _format_datetime(self, datetime_str):
        """Helper method to format datetime string"""
        if not datetime_str:
            return 'N/A'
        try:
            if datetime_str.endswith('Z'):
                dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
            else:
                dt = datetime.fromisoformat(datetime_str)
            return dt.strftime('%B %d, %Y at %I:%M %p')
        except Exception:
            return datetime_str
    
    def ride_status(self, booking):
        """Send email when ride status changes"""
        status = booking.get('status', '').lower()
        
        # Format pickup date and time
        pickup_time_str = booking['pickup_time']
        if pickup_time_str.endswith('Z'):
            pickup_datetime = datetime.fromisoformat(pickup_time_str.replace('Z', '+00:00'))
        else:
            pickup_datetime = datetime.fromisoformat(pickup_time_str)
        
        pickup_date = pickup_datetime.strftime('%B %d, %Y')
        pickup_time = pickup_datetime.strftime('%I:%M %p')
        
        # Status-specific content
        if status == 'completed':
            status_color = '#2d5016'
            status_bg = '#e8f5e9'
            status_message = "Your ride has been completed successfully!"
            subject = f"Ride Completed - {pickup_date}"
        elif status == 'cancelled':
            status_color = '#b71c1c'
            status_bg = '#ffebee'
            status_message = "Your ride has been cancelled."
            subject = f"Ride Cancelled - {pickup_date}"
        else:
            status_color = '#1565c0'
            status_bg = '#e3f2fd'
            status_message = f"Your ride status has been updated to: {status.upper()}"
            subject = f"Ride Status Update - {pickup_date}"
        
        return resend.Emails.send({
            "from": self.from_email,
            "to": "mubskill@gmail.com",
            "subject": subject,
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; margin-bottom: 20px;">Ride Status Update</h2>
                
                <p>Dear {booking['users']['first_name']} {booking['users']['last_name']},</p>
                
                <p style="font-size: 16px; color: {status_color}; background-color: {status_bg}; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <strong>{status_message}</strong>
                </p>
                
                <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Booking Details</h3>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p><strong>Status:</strong><br/>{booking.get('status', 'N/A').upper()}</p>
                    <p style="margin-top: 10px;"><strong>Pickup Location:</strong><br/>{booking['pickup_location']}</p>
                    <p style="margin-top: 10px;"><strong>Pickup Date & Time:</strong><br/>{pickup_date} at {pickup_time}</p>
                    
                    {f"<p style='margin-top: 10px;'><strong>Dropoff Location:</strong><br/>{booking['dropoff_location']}</p>" if booking.get('dropoff_location') else ""}
                    
                    <p style="margin-top: 10px;"><strong>Service Type:</strong><br/>{booking['service_type'].replace('-', ' ').replace('_', ' ').title()}</p>
                </div>
                
                <p>If you have any questions or concerns, please contact our support team.</p>
                
                <p style="font-size: 12px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #666;">
                    This is an automated email. Please do not reply directly to this message.<br/>
                    Booking ID: {booking.get('id', 'N/A')}
                </p>
            </div>
            """})
        
    def ride_active(self, booking):
        # Format pickup date and time
        pickup_time_str = booking['pickup_time']
        # Handle different datetime formats
        if pickup_time_str.endswith('Z'):
            pickup_datetime = datetime.fromisoformat(pickup_time_str.replace('Z', '+00:00'))
        elif '+' in pickup_time_str or pickup_time_str.count('-') >= 3:
            pickup_datetime = datetime.fromisoformat(pickup_time_str)
        else:
            # Fallback: try parsing as is
            pickup_datetime = datetime.fromisoformat(pickup_time_str)
        
        pickup_date = pickup_datetime.strftime('%B %d, %Y')
        pickup_time = pickup_datetime.strftime('%I:%M %p')
        
        # Format dropoff time if available
        dropoff_time_formatted = ''
        if booking.get('dropoff_time'):
            dropoff_time_formatted = self._format_datetime(booking['dropoff_time'])
        
        return resend.Emails.send({
            "from": self.from_email,
            "to": "mubskill@gmail.com",
            "subject": f"Your Ride is Active - Driver Arriving on {pickup_date}",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; margin-bottom: 20px;">Your Ride is Active!</h2>
                
                <p>Dear {booking['users']['first_name']} {booking['users']['last_name']},</p>
                
                <p style="font-size: 16px; color: #2d5016; background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <strong>Great news! Your ride is now active and your driver will be arriving on {pickup_date} at {pickup_time}.</strong>
                </p>
                
                <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Ride Details</h3>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p><strong>Pickup Location:</strong><br/>{booking['pickup_location']}</p>
                    <p style="margin-top: 10px;"><strong>Pickup Date & Time:</strong><br/>{pickup_date} at {pickup_time}</p>
                    
                    {f"<p style='margin-top: 10px;'><strong>Dropoff Location:</strong><br/>{booking['dropoff_location']}</p>" if booking.get('dropoff_location') else ""}
                    
                    {f"<p style='margin-top: 10px;'><strong>Estimated Arrival:</strong><br/>{dropoff_time_formatted}</p>" if dropoff_time_formatted else ""}
                    
                    <p style="margin-top: 10px;"><strong>Service Type:</strong><br/>{booking['service_type'].replace('-', ' ').replace('_', ' ').title()}</p>
                    
                    {f"<p style='margin-top: 10px;'><strong>Duration:</strong><br/>{booking['hours']} {'hour' if booking['hours'] == 1 else 'hours'}</p>" if booking.get('hours') else ""}
                </div>
                
                <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Important Reminders</h3>
                <ul style="line-height: 1.8;">
                    <li>Your driver will arrive 5-10 minutes before the scheduled pickup time</li>
                    <li>Please be ready at the designated pickup location</li>
                    <li>Have your phone available in case the driver needs to contact you</li>
                    {f"<li>{booking['notes']}</li>" if booking.get('notes') else ""}
                </ul>
                
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Need to make changes?</strong></p>
                    <p style="margin: 5px 0 0 0;">If you need to modify your booking or have any questions, please contact us as soon as possible.</p>
                </div>
                
                <p>We look forward to providing you with excellent service!</p>
                
                <p style="font-size: 12px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #666;">
                    This is an automated email. Please do not reply directly to this message.<br/>
                    Booking ID: {booking.get('id', 'N/A')}
                </p>
            </div>
            """})
    
    def new_ride(self, booking):
        # Format pickup date and time
        pickup_time_str = str(booking['pickup_time'])
        if pickup_time_str.endswith('Z'):
            pickup_datetime = datetime.fromisoformat(pickup_time_str.replace('Z', '+00:00'))
        else:
            pickup_datetime = datetime.fromisoformat(pickup_time_str)
        
        pickup_date = pickup_datetime.strftime('%B %d, %Y')
        pickup_time = pickup_datetime.strftime('%I:%M %p')
        
        # Format dropoff time if available
        dropoff_time_formatted = ''
        if booking.get('dropoff_time'):
            dropoff_time_formatted = self._format_datetime(booking['dropoff_time'])
        
        return resend.Emails.send({
            "from": self.from_email,
            "to": "mubskill@gmail.com",
            "subject": f"Booking Received - {pickup_date}",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; margin-bottom: 20px;">Booking Received</h2>
                
                <p>Dear {booking['users']['first_name']} {booking['users']['last_name']},</p>
                
                <p style="font-size: 16px; color: #1565c0; background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <strong>Thank you for choosing our limo service! We have received your booking as seen and it will be confirmed as soon as possible.</strong>
                </p>
                
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <p style="margin: 0;"><strong>What's Next?</strong></p>
                    <p style="margin: 5px 0 0 0;">You will receive a confirmation email once your booking has been reviewed and confirmed by our team.</p>
                </div>
                
                <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Booking Details</h3>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p><strong>Pickup Location:</strong><br/>{booking['pickup_location']}</p>
                    <p style="margin-top: 10px;"><strong>Pickup Date & Time:</strong><br/>{pickup_date} at {pickup_time}</p>
                    
                    {f"<p style='margin-top: 10px;'><strong>Dropoff Location:</strong><br/>{booking['dropoff_location']}</p>" if booking.get('dropoff_location') else ""}
                    
                    {f"<p style='margin-top: 10px;'><strong>Estimated Arrival:</strong><br/>{dropoff_time_formatted}</p>" if dropoff_time_formatted else ""}
                    
                    <p style="margin-top: 10px;"><strong>Service Type:</strong><br/>{booking['service_type'].replace('-', ' ').replace('_', ' ').title()}</p>
                    
                    {f"<p style='margin-top: 10px;'><strong>Duration:</strong><br/>{booking['hours']} {'hour' if booking['hours'] == 1 else 'hours'}</p>" if booking.get('hours') else ""}
                    
                    <p style="margin-top: 10px;"><strong>Total Price:</strong><br/>${booking.get('total_price', 0):.2f}</p>
                    
                    {f"<p style='margin-top: 10px;'><strong>Special Notes:</strong><br/>{booking['notes']}</p>" if booking.get('notes') else ""}
                </div>
                
                <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Important Reminders</h3>
                <ul style="line-height: 1.8;">
                    <li>Your driver will arrive 5-10 minutes before the scheduled pickup time</li>
                    <li>Please be ready at the designated pickup location</li>
                    <li>Have your phone available in case the driver needs to contact you</li>
                    {f"<li>For airport pickups, your driver will monitor flight status</li>" if booking.get('service_type') == 'airport-service' else ""}
                </ul>
                
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Need to make changes?</strong></p>
                    <p style="margin: 5px 0 0 0;">If you need to modify your booking or have any questions, please contact us as soon as possible.</p>
                </div>
                
                <p>We look forward to serving you and will be in touch soon with your confirmation!</p>
                
                <p style="font-size: 12px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #666;">
                    This is an automated acknowledgment email. Please do not reply directly to this message.<br/>
                    Booking ID: {booking.get('id', 'N/A')}
                </p>
            </div>
            """})
    
    def admin(self, booking):
        # Format pickup date and time
        pickup_time_str = str(booking['pickup_time'])
        if pickup_time_str.endswith('Z'):
            pickup_datetime = datetime.fromisoformat(pickup_time_str.replace('Z', '+00:00'))
        else:
            pickup_datetime = datetime.fromisoformat(pickup_time_str)
        
        pickup_date = pickup_datetime.strftime('%B %d, %Y')
        pickup_time = pickup_datetime.strftime('%I:%M %p')
        
        # Format dropoff time if available
        dropoff_time_formatted = ''
        if booking.get('dropoff_time'):
            dropoff_time_formatted = self._format_datetime(booking['dropoff_time'])
        
        return resend.Emails.send({
            "from": self.from_email,
            "to": "mubskill@gmail.com",
            "subject": f"New Booking Alert - {booking['service_type'].replace('_', ' ').replace('-', ' ').title()} | {booking['users']['first_name']} {booking['users']['last_name']}",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; margin-bottom: 20px;">New Booking Received</h2>
                
                <p style="font-size: 16px; color: #b71c1c; background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <strong>ACTION REQUIRED: Assign driver and confirm logistics</strong>
                </p>
                
                <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Customer Information</h3>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p><strong>Name:</strong><br/>{booking['users']['first_name']} {booking['users']['last_name']}</p>
                    <p style="margin-top: 10px;"><strong>Email:</strong><br/>{booking['users']['email']}</p>
                    <p style="margin-top: 10px;"><strong>Phone:</strong><br/>{booking['users']['phone']}</p>
                </div>
                
                <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Ride Details</h3>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p><strong>Service Type:</strong><br/>{booking['service_type'].replace('-', ' ').replace('_', ' ').title()}</p>
                    
                    {f"<p style='margin-top: 10px;'><strong>Pickup Type:</strong><br/>{booking['pickup_type'].replace('_', ' ').title()}</p>" if booking.get('pickup_type') else ""}
                    
                    <p style="margin-top: 10px;"><strong>Pickup Location:</strong><br/>{booking['pickup_location']}</p>
                    <p style="margin-top: 10px;"><strong>Pickup Date & Time:</strong><br/>{pickup_date} at {pickup_time}</p>
                    
                    {f"<p style='margin-top: 10px;'><strong>Dropoff Location:</strong><br/>{booking['dropoff_location']}</p>" if booking.get('dropoff_location') else ""}
                    
                    {f"<p style='margin-top: 10px;'><strong>Estimated Arrival:</strong><br/>{dropoff_time_formatted}</p>" if dropoff_time_formatted else ""}
                    
                    {f"<p style='margin-top: 10px;'><strong>Duration:</strong><br/>{booking['hours']} {'hour' if booking['hours'] == 1 else 'hours'}</p>" if booking.get('hours') else ""}
                    
                    {f"<p style='margin-top: 10px;'><strong>Special Notes:</strong><br/>{booking['notes']}</p>" if booking.get('notes') else ""}
                </div>
                
                <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p style="margin: 0;"><strong>Total Price:</strong></p>
                    <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #2d5016;">${booking.get('total_price', 0):.2f}</p>
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Status:</strong> {booking.get('status', 'PENDING').upper()} Change status {base_url}/admin/dashboard</p>
                </div>
                
                <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Next Steps</h3>
                <ol style="line-height: 1.8;">
                    <li>Review booking details and confirm availability</li>
                    <li>Assign available driver</li>
                    <li>Confirm vehicle readiness</li>
                    <li>Update booking status to "active"</li>
                    <li>Monitor pickup status</li>
                </ol>
                
                <p style="font-size: 12px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #666;">
                    Booking received at: {pickup_date} at {pickup_time}<br/>
                    Booking ID: {booking.get('id', 'N/A')}<br/>
                    This is an automated notification from the booking system.
                </p>
            </div>
            """})
    
    def ride_completed(self, booking):
        # Format pickup date and time
        pickup_time_str = booking['pickup_time']
        if pickup_time_str.endswith('Z'):
            pickup_datetime = datetime.fromisoformat(pickup_time_str.replace('Z', '+00:00'))
        else:
            pickup_datetime = datetime.fromisoformat(pickup_time_str)
        
        pickup_date = pickup_datetime.strftime('%B %d, %Y')
        
        return resend.Emails.send({
            "from": self.from_email,
            "to": "mubskill@gmail.com",
            "subject": f"Thank You for Choosing BHO Premium Limo Service!",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; margin-bottom: 20px;">Thank You!</h2>
                
                <p>Dear {booking['users']['first_name']} {booking['users']['last_name']},</p>
                
                <p style="font-size: 16px; color: #2d5016; background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <strong>Your ride on {pickup_date} has been completed. Thank you for choosing BHO Premium Limo Service!</strong>
                </p>
                
                <p>We hope you had an excellent experience with our premium limo service. Your satisfaction is our top priority, and we're grateful for the opportunity to serve you.</p>
                
                <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Your Recent Ride</h3>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p><strong>Service Type:</strong><br/>{booking['service_type'].replace('-', ' ').replace('_', ' ').title()}</p>
                    <p style="margin-top: 10px;"><strong>Pickup Location:</strong><br/>{booking['pickup_location']}</p>
                    
                    {f"<p style='margin-top: 10px;'><strong>Dropoff Location:</strong><br/>{booking['dropoff_location']}</p>" if booking.get('dropoff_location') else ""}
                </div>
                
                <div style="background-color: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #1565c0;">We Hope to Serve You Again!</p>
                    <p style="margin: 0; color: #333;">We would be honored to continue providing you with exceptional limo service for all your transportation needs. Whether it's airport transfers, special events, or hourly bookings, we're here to make every ride memorable.</p>
                </div>
                
                <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Why Choose Us Again?</h3>
                <ul style="line-height: 1.8;">
                    <li>Premium vehicles and professional drivers</li>
                    <li>Reliable and punctual service</li>
                    <li>Easy online booking system</li>
                    <li>Competitive pricing and flexible options</li>
                </ul>
                
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Your Feedback Matters</strong></p>
                    <p style="margin: 5px 0 0 0;">We'd love to hear about your experience! Your feedback helps us improve and serve you better.</p>
                </div>
                
                <p style="margin-top: 30px;">Thank you again for choosing BHO Premium Limo Service. We look forward to serving you again soon!</p>
                
                <p style="margin-top: 20px; font-weight: bold;">Best regards,<br/>The BHO Premium Limo Service Team</p>
                
                <p style="font-size: 12px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #666;">
                    This is an automated email. Please do not reply directly to this message.<br/>
                    Booking ID: {booking.get('id', 'N/A')}
                </p>
            </div>
            """})
    
    def ride_cancelled(self, booking):
        # Format pickup date and time
        pickup_time_str = booking['pickup_time']
        if pickup_time_str.endswith('Z'):
            pickup_datetime = datetime.fromisoformat(pickup_time_str.replace('Z', '+00:00'))
        else:
            pickup_datetime = datetime.fromisoformat(pickup_time_str)
        
        pickup_date = pickup_datetime.strftime('%B %d, %Y')
        pickup_time = pickup_datetime.strftime('%I:%M %p')
        
        return resend.Emails.send({
            "from": self.from_email,
            "to": "mubskill@gmail.com",
            "subject": f"Ride Cancelled - {pickup_date}",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; margin-bottom: 20px;">Ride Cancelled</h2>
                
                <p>Dear {booking['users']['first_name']} {booking['users']['last_name']},</p>
                
                <p style="font-size: 16px; color: #b71c1c; background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <strong>Your ride scheduled for {pickup_date} at {pickup_time} has been cancelled.</strong>
                </p>
                
                <h3 style="color: #333; margin-top: 30px; margin-bottom: 15px;">Cancelled Booking Details</h3>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <p><strong>Service Type:</strong><br/>{booking['service_type'].replace('-', ' ').replace('_', ' ').title()}</p>
                    <p style="margin-top: 10px;"><strong>Pickup Location:</strong><br/>{booking['pickup_location']}</p>
                    <p style="margin-top: 10px;"><strong>Scheduled Date & Time:</strong><br/>{pickup_date} at {pickup_time}</p>
                    
                    {f"<p style='margin-top: 10px;'><strong>Dropoff Location:</strong><br/>{booking['dropoff_location']}</p>" if booking.get('dropoff_location') else ""}
                </div>
                
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Need to Book Again?</strong></p>
                    <p style="margin: 5px 0 0 0;">If you'd like to reschedule or book a new ride, please visit our booking page or contact our support team.</p>
                </div>
                
                <p>If you have any questions about this cancellation, please don't hesitate to contact us.</p>
                
                <p style="font-size: 12px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; color: #666;">
                    This is an automated email. Please do not reply directly to this message.<br/>
                    Booking ID: {booking.get('id', 'N/A')}
                </p>
            </div>
            """})