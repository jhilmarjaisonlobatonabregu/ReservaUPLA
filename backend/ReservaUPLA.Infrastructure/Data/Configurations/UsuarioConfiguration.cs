using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Infrastructure.Data.Configurations;

public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("Usuarios");
        builder.HasKey(u => u.Id);
        builder.Property(u => u.NombreCompleto).HasMaxLength(150).IsRequired();
        builder.Property(u => u.Correo).HasMaxLength(150).IsRequired();
        builder.HasIndex(u => u.Correo).IsUnique();
        builder.Property(u => u.Rol).HasMaxLength(50).IsRequired();
        builder.Property(u => u.Activo).IsRequired();
    }
}
