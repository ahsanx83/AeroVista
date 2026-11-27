using AeroVista.Application.DTOs;
using AeroVista.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AeroVista.API.Controllers;


[ApiController]
[Route("api/flights")]
public class FlightsController : ControllerBase
{
    private readonly IFlightService _flights;
    public FlightsController(IFlightService flights) => _flights = flights;

    [HttpPost("search")]
    public async Task<ActionResult<IEnumerable<FlightSearchResultDto>>> Search(FlightSearchRequest req, CancellationToken ct)
        => Ok(await _flights.SearchAsync(req, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FlightSearchResultDto>> Get(Guid id, CancellationToken ct)
    {
        var f = await _flights.GetByIdAsync(id, ct);
        return f is null ? NotFound() : Ok(f);
    }
}