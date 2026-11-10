using Microsoft.Extensions.DependencyInjection;
using ReservaUPLA.Application.Interfaces.Services;
using ReservaUPLA.Application.Services;

namespace ReservaUPLA.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddScoped<IUsuarioService, UsuarioService>();
        services.AddScoped<IAmbienteService, AmbienteService>();
        services.AddScoped<IReservaService, ReservaService>();
        services.AddScoped<IDashboardService, DashboardService>();

        return services;
    }
}
