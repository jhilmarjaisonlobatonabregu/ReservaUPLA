using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using ReservaUPLA.Application.Common;

namespace ReservaUPLA.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        if (context.Response.HasStarted)
        {
            _logger.LogWarning("La respuesta HTTP ya ha comenzado.");
            return;
        }

        int statusCode;
        object responseBody;

        switch (exception)
        {
            case DbUpdateException dbEx when dbEx.InnerException is PostgresException pg && pg.SqlState == "23P01":
                _logger.LogWarning(dbEx, "Conflicto de solapamiento concurrente (EXCLUDE gist 23P01)");
                statusCode = StatusCodes.Status409Conflict;
                responseBody = new
                {
                    isSuccess = false,
                    message = MensajesCatalogo.RN01_ConflictoHorarioConcurrente,
                    errores = new[] { MensajesCatalogo.RN01_ConflictoHorarioConcurrente }
                };
                break;

            case DbUpdateException dbEx when dbEx.InnerException is PostgresException pg && pg.SqlState == "23505":
                _logger.LogWarning(dbEx, "Violación de clave única (23505)");
                statusCode = StatusCodes.Status409Conflict;
                responseBody = new
                {
                    isSuccess = false,
                    message = MensajesCatalogo.RegistroDuplicado,
                    errores = new[] { MensajesCatalogo.RegistroDuplicado }
                };
                break;

            default:
                _logger.LogError(
                    exception,
                    "Error no controlado procesando {Method} {Path}",
                    context.Request.Method,
                    context.Request.Path
                );
                statusCode = StatusCodes.Status500InternalServerError;
                responseBody = new
                {
                    isSuccess = false,
                    message = "Error interno del servidor.",
                    errores = new[] { "Error interno del servidor." }
                };
                break;
        }

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json; charset=utf-8";

        var json = JsonSerializer.Serialize(responseBody, JsonOptions);
        await context.Response.WriteAsync(json);
    }
}
