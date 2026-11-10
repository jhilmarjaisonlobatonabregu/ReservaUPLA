namespace ReservaUPLA.Application.Common;

using System.Text.Json.Serialization;

/// <summary>
/// Categoría semántica del resultado — usada por controladores para elegir el código HTTP
/// sin comparar strings de mensaje (Clean Architecture, Fase 3).
/// </summary>
public enum ResultErrorCode
{
    None = 0,
    Validation,     // 400 Bad Request
    Forbidden,      // 403 Forbidden
    NotFound,       // 404 Not Found
    Conflict        // 409 Conflict
}

/// <summary>
/// Representa el resultado de una operación de negocio (Result Pattern - Clean Architecture).
/// </summary>
public class Result
{
    public bool IsSuccess { get; }
    [JsonIgnore] public bool IsFailure => !IsSuccess;
    [JsonIgnore] public bool Exito => IsSuccess;

    public string Message { get; }
    [JsonIgnore] public string Mensaje => Message;

    public List<string> Errores { get; }

    /// <summary>Código semántico del error — permite a los controladores elegir el HTTP status sin comparar strings.</summary>
    public ResultErrorCode ErrorCode { get; }

    protected Result(bool isSuccess, string message, List<string>? errores = null, ResultErrorCode errorCode = ResultErrorCode.None)
    {
        IsSuccess = isSuccess;
        Message = message;
        Errores = errores ?? (isSuccess ? new List<string>() : new List<string> { message });
        ErrorCode = errorCode;
    }

    public static Result Success(string message = "Operación completada con éxito.") =>
        new(true, message);

    public static Result Failure(string message, List<string>? errores = null, ResultErrorCode errorCode = ResultErrorCode.Validation) =>
        new(false, message, errores, errorCode);

    public static Result Exitoso(string message = "Operación completada con éxito.") =>
        Success(message);

    public static Result Fallido(string message, List<string>? errores = null, ResultErrorCode errorCode = ResultErrorCode.Validation) =>
        Failure(message, errores, errorCode);
}

/// <summary>
/// Representa el resultado tipado de una operación de negocio con valor de retorno (Result Pattern - Clean Architecture).
/// </summary>
public class Result<T> : Result
{
    [JsonIgnore] public T? Value { get; }
    public T? Data => Value;
    [JsonIgnore] public T? Datos => Value;

    protected Result(T? value, bool isSuccess, string message, List<string>? errores = null, ResultErrorCode errorCode = ResultErrorCode.None)
        : base(isSuccess, message, errores, errorCode)
    {
        Value = value;
    }

    public static Result<T> Success(T value, string message = "Operación completada con éxito.") =>
        new(value, true, message);

    public static new Result<T> Failure(string message, List<string>? errores = null, ResultErrorCode errorCode = ResultErrorCode.Validation) =>
        new(default, false, message, errores, errorCode);

    public static Result<T> Exitoso(T data, string message = "Operación completada con éxito.") =>
        Success(data, message);

    public static new Result<T> Fallido(string message, List<string>? errores = null, ResultErrorCode errorCode = ResultErrorCode.Validation) =>
        Failure(message, errores, errorCode);
}
