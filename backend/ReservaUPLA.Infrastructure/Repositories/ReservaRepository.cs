using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Domain.Common;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Domain.Interfaces.Repositories;
using ReservaUPLA.Infrastructure.Data;

namespace ReservaUPLA.Infrastructure.Repositories;

public class ReservaRepository : IReservaRepository
{
    private readonly AppDbContext _context;

    public ReservaRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Reserva>> ListarFiltradasAsync(
        Guid? ambienteId = null,
        string? estado = null,
        DateOnly? fecha = null,
        Guid? usuarioId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Reservas
            .AsNoTracking()
            .Include(r => r.Usuario)
            .Include(r => r.Ambiente)
            .AsQueryable();

        if (ambienteId.HasValue && ambienteId.Value != Guid.Empty)
        {
            query = query.Where(r => r.AmbienteId == ambienteId.Value);
        }

        if (!string.IsNullOrWhiteSpace(estado) &&
            !estado.Equals("Todos", StringComparison.OrdinalIgnoreCase))
        {
            var estadoLimpio = estado.Trim();
            query = query.Where(r => r.Estado == estadoLimpio);
        }

        if (fecha.HasValue)
        {
            query = query.Where(r => r.Fecha == fecha.Value);
        }

        if (usuarioId.HasValue && usuarioId.Value != Guid.Empty)
        {
            query = query.Where(r => r.UsuarioId == usuarioId.Value);
        }

        return await query
            .OrderByDescending(r => r.Fecha)
            .ThenBy(r => r.HoraInicio)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Reserva>> ListarTodasConRelacionesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Reservas
            .AsNoTracking()
            .Include(r => r.Usuario)
            .Include(r => r.Ambiente)
            .OrderByDescending(r => r.Fecha)
            .ThenBy(r => r.HoraInicio)
            .ToListAsync(cancellationToken);
    }

    public async Task<Reserva?> ObtenerPorIdConRelacionesAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Reservas
            .Include(r => r.Usuario)
            .Include(r => r.Ambiente)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<List<Reserva>> ObtenerConflictosAprobadosAsync(
        Guid ambienteId,
        DateOnly fecha,
        TimeOnly horaInicio,
        TimeOnly horaFin,
        Guid? excluirReservaId = null,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Reservas
            .AsNoTracking()
            .Include(r => r.Usuario)
            .Where(r => r.AmbienteId == ambienteId
                     && r.Fecha == fecha
                     && r.Estado == ReservaConstantes.ReservaAprobada
                     && r.HoraInicio < horaFin
                     && r.HoraFin > horaInicio);

        if (excluirReservaId.HasValue)
        {
            query = query.Where(r => r.Id != excluirReservaId.Value);
        }

        return await query
            .OrderBy(r => r.HoraInicio)
            .ToListAsync(cancellationToken);
    }

    public async Task AgregarAsync(Reserva reserva, CancellationToken cancellationToken = default)
    {
        await _context.Reservas.AddAsync(reserva, cancellationToken);
    }

    public Task ActualizarAsync(Reserva reserva, CancellationToken cancellationToken = default)
    {
        _context.Reservas.Update(reserva);
        return Task.CompletedTask;
    }

    public async Task GuardarCambiosAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
