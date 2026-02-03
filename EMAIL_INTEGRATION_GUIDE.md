# Email Integration Guide

## Frontend Implementation Complete ✅

The React frontend has been updated to support email notifications when adding packages:

### What's Been Added:korisnik@DESKTOP-EB1G0H9 MINGW64 /d/code/storage-unit-inventory-tracker
$ npm run dev

> storage-unit-inventory-tracker@0.0.0 dev
> vite


  VITE v6.3.5  ready in 140 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
- **Email notification checkbox** - Users can enable/disable email notifications
- **Custom message field** - Optional personalized message for the notification
- **User email display** - Shows which email address will receive the notification
- **Enhanced User model** - Now includes email address field
- **Updated API calls** - Sends email options to the backend

### Frontend Features:
1. When a surname is selected, the form automatically finds the matching user and displays their email
2. Users can add custom messages to the notification emails
3. Clear visual feedback shows when email notifications will be sent
4. Graceful handling when no email address is found for a user

## Backend Implementation Required 🚀

You need to implement the email service in your C# backend. Here's what needs to be done:

### 1. Update Your Package Model
```csharp
public class CreatePackageRequest
{
    public string Id { get; set; }
    public string Surname { get; set; }
    public double Weight { get; set; }
    public EmailNotificationOptions? EmailNotification { get; set; }
}

public class EmailNotificationOptions
{
    public bool SendNotification { get; set; }
    public string? NotificationMessage { get; set; }
}
```

### 2. Update Your User Model
```csharp
public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }  // Add this field
    public string Status { get; set; }
}
```

### 3. Install Email Service Package
```bash
dotnet add package MailKit
# or
dotnet add package SendGrid
# or use your preferred email service
```

### 4. Create Email Service
```csharp
public interface IEmailService
{
    Task SendPackageArrivalNotificationAsync(string toEmail, string surname, string packageId, string? customMessage = null);
}

public class EmailService : IEmailService
{
    // Implement your email service here
    // Use MailKit, SendGrid, or your preferred email provider
}
```

### 5. Update Package Controller
```csharp
[HttpPost]
public async Task<IActionResult> CreatePackage([FromBody] CreatePackageRequest request)
{
    // Create package logic...

    if (request.EmailNotification?.SendNotification == true)
    {
        var user = await _userService.GetUserBySurnameAsync(request.Surname);
        if (user?.Email != null)
        {
            await _emailService.SendPackageArrivalNotificationAsync(
                user.Email,
                request.Surname,
                request.Id,
                request.EmailNotification.NotificationMessage
            );
        }
    }

    // Return response...
}
```

### 6. Configure Email Settings
Add to your `appsettings.json`:
```json
{
  "EmailSettings": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": 587,
    "EnableSsl": true,
    "FromEmail": "your-app@example.com",
    "FromName": "Storage Unit Tracker",
    "Username": "your-email@example.com",
    "Password": "your-app-password"
  }
}
```

### 7. Register Services
In `Program.cs` or `Startup.cs`:
```csharp
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddScoped<IEmailService, EmailService>();
```

## Recommended Email Providers:
1. **SendGrid** - Great for production, reliable delivery
2. **MailKit with Gmail/Outlook** - Good for development and small scale
3. **AWS SES** - Cost-effective for high volume
4. **Azure Communication Services** - If you're already using Azure

## Security Considerations:
- Store email credentials in secure configuration (Azure Key Vault, etc.)
- Use environment variables for sensitive data
- Implement rate limiting to prevent email spam
- Add email validation and sanitization
- Log email sending attempts for auditing

## Testing:
- Test with real email addresses during development
- Use email testing services like Mailtrap for development
- Implement email preview functionality for debugging

## Sample Email Template:
```
Subject: Package Arrival Notification - Storage Unit

Dear [User Name],

A new package has arrived for you at the storage unit:

📦 Package ID: [Package ID]
📊 Weight: [Weight] kg
📅 Arrival Date: [Date]

[Custom Message if provided]

Please collect your package at your earliest convenience.

Best regards,
Storage Unit Management Team
```
