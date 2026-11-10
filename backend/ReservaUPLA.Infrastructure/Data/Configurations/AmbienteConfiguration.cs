using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Infrastructure.Data.Configurations;

public class AmbienteConfiguration : IEntityTypeConfiguration<Ambiente>
{
    public void Configure(EntityTypeBuilder<Ambiente> builder)
    {
        builder.ToTable("Ambientes");
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Nombre).HasMaxLength(100).IsRequired();
        builder.HasIndex(a => a.Nombre).IsUnique();
        builder.Property(a => a.Tipo).HasMaxLength(50).IsRequired();
        builder.Property(a => a.Capacidad).IsRequired();
        builder.Property(a => a.Ubicacion).HasMaxLength(100).IsRequired();
        builder.Property(a => a.Estado).HasMaxLength(30).IsRequired();
    }
}
