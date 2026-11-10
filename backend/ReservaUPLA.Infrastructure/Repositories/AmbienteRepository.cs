using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Domain.Interfaces.Repositories;
using ReservaUPLA.Infrastructure.Data;

namespace ReservaUPLA.Infrastructure.Repositories;

public class AmbienteRepository : IAmbienteRepository
{
    private readonly AppDbContext _context;

    public AmbienteRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Ambiente>> ListarConReservasAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Ambientes
            .AsNoTracking()
            .Include(a => a.Reservas)
            .OrderBy(a => a.Nombre)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Ambiente>> ListarTodosAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Ambientes
            .AsNoTracking()
            .OrderBy(a => a.Nombre)
            .ToListAsync(cancellationToken);
    }

    // RN-MVP: Responsable de ambiente solo ve los ambientes asignados en AsignacionesResponsable.
    // Dos pasos: primero obtiene los IDs asignados, luego filtra Ambientes por esos IDs.
    public async Task<List<Ambiente>> ListarPorResponsableAsync(Guid responsableId, CancellationToken cancellationToken = default)
    {
        var idsAsignados = await _context.Database
            .SqlQuery<Guid>($"SELECT \"AmbienteId\" AS \"Value\" FROM \"AsignacionesResponsable\" WHERE \"UsuarioId\" = {responsableId}")
            .ToListAsync(cancellationToken);

        return await _context.Ambientes
            .AsNoTracking()
            .Include(a => a.Reservas)
            .Where(a => idsAsignados.Contains(a.Id))
            .OrderBy(a => a.Nombre)
            .ToListAsync(cancellationToken);
    }

    public async Task<Ambiente?> ObtenerPorIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Ambientes
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    public async Task<bool> ExisteNombreAsync(string nombreNormalizado, CancellationToken cancellationToken = default)
    {
        return await _context.Ambientes
            .AnyAsync(a => a.Nombre.ToLower() == nombreNormalizado.ToLower(), cancellationToken);
    }

    public async Task AgregarAsync(Ambiente ambiente, CancellationToken cancellationToken = default)
    {
        await _context.Ambientes.AddAsync(ambiente, cancellationToken);
    }

    public async Task GuardarCambiosAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
