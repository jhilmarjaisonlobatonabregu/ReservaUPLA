using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.Common;
using ReservaUPLA.Application.DTOs.Usuarios;
using ReservaUPLA.Application.Interfaces.Services;

namespace ReservaUPLA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;

    public UsuariosController(IUsuarioService usuarioService)
    {
        _usuarioService = usuarioService;
    }

    [HttpGet]
    public async Task<ActionResult<List<UsuarioResponseDto>>> Listar(CancellationToken cancellationToken)
    {
        var usuarios = await _usuarioService.ListarUsuariosAsync(cancellationToken);
        return Ok(usuarios);
    }

    [HttpPost]
    public async Task<ActionResult<Result<UsuarioResponseDto>>> Registrar(
        [FromBody] CrearUsuarioDto dto,
        CancellationToken cancellationToken)
    {
        var rolActor = Request.Headers["X-Usuario-Rol"].FirstOrDefault();
        var resultado = await _usuarioService.RegistrarUsuarioAsync(dto, rolActor, cancellationToken);
        if (!resultado.IsSuccess)
            return resultado.ErrorCode switch
            {
                ResultErrorCode.Forbidden => StatusCode(StatusCodes.Status403Forbidden, resultado),
                ResultErrorCode.Conflict  => Conflict(resultado),
                _                         => BadRequest(resultado)
            };

        return Created($"/api/usuarios/{resultado.Data?.Id}", resultado);
    }
}
