using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Infrastructure.Data.Configurations;

public class ReservaConfiguration : IEntityTypeConfiguration<Reserva>
{
    public void Configure(EntityTypeBuilder<Reserva> builder)
    {
        builder.ToTable("Reservas");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Fecha).IsRequired();
        builder.Property(r => r.HoraInicio).IsRequired();
        builder.Property(r => r.HoraFin).IsRequired();
        builder.Property(r => r.Motivo).IsRequired();
        builder.Property(r => r.Estado).HasMaxLength(30).IsRequired();

        builder.HasOne(r => r.Usuario)
               .WithMany(u => u.Reservas)
               .HasForeignKey(r => r.UsuarioId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Ambiente)
               .WithMany(a => a.Reservas)
               .HasForeignKey(r => r.AmbienteId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
