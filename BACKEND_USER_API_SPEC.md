# User Management API Specification for C# Backend

## Overview
This document specifies the API endpoint required for adding new users to the Supabase database from the frontend application.

## Database Schema
Based on the Supabase table structure:

**Table: `Users`**
| Column | Type | Constraints |
|--------|------|-------------|
| id | int8 | PRIMARY KEY, AUTO_INCREMENT |
| created_at | timestamptz | DEFAULT NOW() |
| name | text | NOT NULL |
| email | text | NOT NULL, UNIQUE (recommended) |
| status | text | DEFAULT 'active' |

## API Endpoint Specification

### POST /api/users

Creates a new user in the database.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "name": "string",
  "email": "string"
}
```

**Example Request:**
```json
{
  "name": "Kec",
  "email": "darko.kec@gmail.com"
}
```

#### Response

**Success (201 Created):**
```json
{
  "id": 3,
  "created_at": "2026-02-03T14:13:27+00:00",
  "name": "Kec",
  "email": "darko.kec@gmail.com",
  "status": "active"
}
```

**Error (400 Bad Request):**
```json
{
  "message": "Name and email are required"
}
```

**Error (409 Conflict):**
```json
{
  "message": "A user with this email already exists"
}
```

**Error (500 Internal Server Error):**
```json
{
  "message": "Failed to create user",
  "detail": "Error details here"
}
```

## C# Implementation Guide

### 1. Create User Model (Models/User.cs)
```csharp
namespace InventoryApi.Models
{
    public class User
    {
        public long Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Status { get; set; } = "active";
    }
}
```

### 2. Create Request DTO (Models/CreateUserRequest.cs)
```csharp
using System.ComponentModel.DataAnnotations;

namespace InventoryApi.Models
{
    public class CreateUserRequest
    {
        [Required(ErrorMessage = "Name is required")]
        public string Name { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        public string Email { get; set; } = string.Empty;
    }
}
```

### 3. Create Users Controller (Controllers/UsersController.cs)

```csharp
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using InventoryApi.Models;
using System.ComponentModel.DataAnnotations;

namespace InventoryApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IConfiguration configuration, ILogger<UsersController> logger)
        {
            _connectionString = configuration.GetConnectionString("SupabaseConnection")
                ?? throw new InvalidOperationException("Connection string not found");
            _logger = logger;
        }

        // GET /api/users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            try
            {
                var users = new List<User>();

                await using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();

                var query = @"
                    SELECT id, created_at, name, email, status
                    FROM ""Users""
                    ORDER BY created_at DESC";

                await using var command = new NpgsqlCommand(query, connection);
                await using var reader = await command.ExecuteReaderAsync();

                while (await reader.ReadAsync())
                {
                    users.Add(new User
                    {
                        Id = reader.GetInt64(0),
                        CreatedAt = reader.GetDateTime(1),
                        Name = reader.GetString(2),
                        Email = reader.GetString(3),
                        Status = reader.IsDBNull(4) ? "active" : reader.GetString(4)
                    });
                }

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching users");
                return StatusCode(500, new { message = "Failed to fetch users", detail = ex.Message });
            }
        }

        // POST /api/users
        [HttpPost]
        public async Task<ActionResult<User>> CreateUser([FromBody] CreateUserRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await using var connection = new NpgsqlConnection(_connectionString);
                await connection.OpenAsync();

                // Check if email already exists
                var checkQuery = @"SELECT COUNT(*) FROM ""Users"" WHERE LOWER(email) = LOWER(@email)";
                await using var checkCommand = new NpgsqlCommand(checkQuery, connection);
                checkCommand.Parameters.AddWithValue("email", request.Email);

                var count = Convert.ToInt64(await checkCommand.ExecuteScalarAsync());
                if (count > 0)
                {
                    return Conflict(new { message = "A user with this email already exists" });
                }

                // Insert new user
                var insertQuery = @"
                    INSERT INTO ""Users"" (name, email, status, created_at)
                    VALUES (@name, @email, 'active', NOW())
                    RETURNING id, created_at, name, email, status";

                await using var insertCommand = new NpgsqlCommand(insertQuery, connection);
                insertCommand.Parameters.AddWithValue("name", request.Name);
                insertCommand.Parameters.AddWithValue("email", request.Email.ToLower());

                await using var reader = await insertCommand.ExecuteReaderAsync();

                if (await reader.ReadAsync())
                {
                    var user = new User
                    {
                        Id = reader.GetInt64(0),
                        CreatedAt = reader.GetDateTime(1),
                        Name = reader.GetString(2),
                        Email = reader.GetString(3),
                        Status = reader.GetString(4)
                    };

                    _logger.LogInformation("User created successfully: {Email}", user.Email);
                    return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, user);
                }

                return StatusCode(500, new { message = "Failed to create user" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, new { message = "Failed to create user", detail = ex.Message });
            }
        }
    }
}
```

### 4. Update appsettings.json

Ensure your connection string is configured:

```json
{
  "ConnectionStrings": {
    "SupabaseConnection": "Host=your-supabase-host.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=your-password;SSL Mode=Require;"
  }
}
```

## Testing

### Using curl:
```bash
# Create a new user
curl -X POST http://localhost:5234/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"TestUser","email":"test@example.com"}'

# Get all users
curl http://localhost:5234/api/users
```

### Using PowerShell:
```powershell
# Create a new user
Invoke-WebRequest -Uri "http://localhost:5234/api/users" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"TestUser","email":"test@example.com"}'

# Get all users
Invoke-WebRequest -Uri "http://localhost:5234/api/users"
```

## CORS Configuration

Ensure CORS is configured in `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ... after building app
app.UseCors("AllowFrontend");
```

## Notes

1. Email addresses are stored in lowercase to prevent duplicate entries with different casing
2. The `status` field defaults to "active"
3. `created_at` is automatically set to the current timestamp
4. Email uniqueness should be enforced at the database level with a UNIQUE constraint for data integrity
5. Consider adding email format validation at the database level as well
