using Microsoft.OpenApi.Models;
using ReservaUPLA.API.Middleware;
using ReservaUPLA.Application;
using ReservaUPLA.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Inyección de dependencias de Clean Architecture
builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ReservaUPLA API",
        Version = "v1",
        Description = "API REST del Sistema de Gestión de Reservas de Ambientes Universitarios (Clean Architecture)"
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
                string.IsNullOrWhiteSpace(origin) ||
                origin == "null" ||
                (Uri.TryCreate(origin, UriKind.Absolute, out var uri) &&
                 (uri.Host == "localhost" || uri.Host == "127.0.0.1")))
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ReservaUPLA API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("CorsPolicy");

app.MapControllers();

app.Run();
