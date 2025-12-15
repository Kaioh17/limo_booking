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
                <h2 style="color: #333; margin-bottom: 20px;">Password Updated</h2>
                
                <p>Dear {name},</p>
                
                <p>Your password has been successfully updated.</p>
                
                <p>If you did not make this change, please contact support immediately.</p>
                
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
        if len(token) > 6:
            modified_token = f"0{token}"
        return resend.Emails.send({
            "from": from_email,
            "to": "mubskill@gmail.com",  # Use actual customer email
            "subject": "OTP",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>One Time Password</h2>
                <p>Your OTP code is: <strong>{modified_token}</strong></p>
                <p>This token will expire in 5 minutes.</p>
                <p style="font-size: 12px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">
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
    
    def new_ride(self):
        return resend.Emails.send({
            "from": self.from_email,
            "to": "mubskill@gmail.com",
            "subject": "New Ride Assignment",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>New Ride Assignment</h2>
                <p>You have been assigned a new ride. Please check your dashboard for details.</p>
                <p style="font-size: 12px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">
                    This is an automated email. Please do not reply directly to this message.
                </p>
            </div>
            """})
    
class BookingEmails:
    """
    notify artists
    """

    from_email = "Acme <noreply@resend.dev>"

    def __init__(self, email):
        self.email = email
    
    def new_ride(self, booking):
        return resend.Emails.send({
            "from": self.from_email,
            "to": "mubskill@gmail.com",
            "subject": "Your Ride is Confirmed - Booking Details Inside",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Ride Confirmation</h2>
                
                <p>Dear {booking['users']['first_name']} {booking['users']['last_name']},</p>
                
                <p>Thank you for choosing our limo service! Your ride has been confirmed.</p>
                
                <h3>Booking Details</h3>
                
                <p><strong>Pickup Location:</strong><br/>{booking['pickup_location']}</p>
                <p><strong>Pickup Time:</strong><br/>{booking['pickup_time']}</p>
                
                <p><strong>Dropoff Location:</strong><br/>{booking['dropoff_location']}</p>
                <p><strong>Estimated Arrival:</strong><br/>{booking['dropoff_time']}</p>
                
                <p><strong>Service Type:</strong><br/>{booking['service_type'].replace('_', ' ').title()}</p>
                
                <p><strong>Total Price:</strong><br/>${booking['total_price']}</p>
                
                {f"<p><strong>Special Notes:</strong><br/>{booking['notes']}</p>" if booking.get('notes') else ""}
                
                <h3>Contact Information</h3>
                <p>Phone: {booking['users']['phone']}</p>
                <p>Email: {booking['users']['email']}</p>
                
                <h3>Important Reminders</h3>
                <ul>
                    <li>Your driver will arrive 5-10 minutes before scheduled pickup time</li>
                    <li>Please be ready at the designated pickup location</li>
                    <li>For airport pickups, your driver will monitor flight status</li>
                </ul>
                
                <p>Need to make changes or have questions? Contact us at [your_support_email] or [your_phone_number]</p>
                
                <p>We look forward to serving you!</p>
                
                <p style="font-size: 12px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">
                    This is an automated confirmation email. Please do not reply directly to this message.
                </p>
            </div>
            """})
    
    def admin(self, booking):
        return resend.Emails.send({
            "from": self.from_email,
            "to": "mubskill@gmail.com",  # Use actual admin email
            "subject": f"New Booking Alert - {booking['service_type'].replace('_', ' ').title()} | {booking['users']['first_name']} {booking['users']['last_name']}",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
                <h2>New Booking Received</h2>
                
                <p><strong>ACTION REQUIRED: Assign driver and confirm logistics</strong></p>
                
                <h3>Customer Information</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; width: 150px;">Name:</td>
                        <td style="padding: 8px 0;">{booking['users']['first_name']} {booking['users']['last_name']}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                        <td style="padding: 8px 0;">{booking['users']['email']}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                        <td style="padding: 8px 0;">{booking['users']['phone']}</td>
                    </tr>
                </table>
                
                <h3>Ride Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold; width: 150px;">Service Type:</td>
                        <td style="padding: 8px 0;">{booking['service_type'].replace('_', ' ').title()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Pickup:</td>
                        <td style="padding: 8px 0;">{booking['pickup_location']}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Pickup Time:</td>
                        <td style="padding: 8px 0;">{booking['pickup_time']}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Dropoff:</td>
                        <td style="padding: 8px 0;">{booking['dropoff_location']}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; font-weight: bold;">Est. Arrival:</td>
                        <td style="padding: 8px 0;">{booking['dropoff_time']}</td>
                    </tr>
                    {f"<tr><td style='padding: 8px 0; font-weight: bold;'>Hours:</td><td style='padding: 8px 0;'>{booking['hours']}</td></tr>" if booking.get('hours') else ""}
                </table>
                
                <h3>Financial</h3>
                <p><strong>${booking['total_price']}</strong></p>
                <p>Total Booking Amount</p>
                
                {f"<h3>Special Notes</h3><p>{booking['notes']}</p>" if booking.get('notes') else ""}
                
                <p><strong>Status:</strong> {booking['status'].upper()}</p>
                
                <h3>Next Steps</h3>
                <ol>
                    <li>Assign available driver</li>
                    <li>Confirm vehicle readiness</li>
                    <li>Send driver details to customer</li>
                    <li>Monitor pickup status</li>
                </ol>
                
                <p style="font-size: 12px; margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd;">
                    Booking received at: {booking['pickup_time']}<br/>
                    This is an automated notification from the booking system.
                </p>
            </div>
            """})