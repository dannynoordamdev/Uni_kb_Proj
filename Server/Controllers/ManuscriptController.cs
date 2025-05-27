using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class ManuscriptsController : ControllerBase
{
    private readonly MyContext _context;

    public ManuscriptsController(MyContext context)
    {
        _context = context;
    }



        private static readonly Dictionary<string, string> IsoToCountryName = new(StringComparer.OrdinalIgnoreCase)
    {
        { "FRA", "France" },
        { "DEU", "Germany" },
        { "ESP", "Spain" },
        { "ITA", "Italy" },
        { "GBR", "United Kingdom" },
        { "NLD", "Netherlands" },
        { "BEL", "Belgium" },
        { "POL", "Poland" },
        { "CHE", "Switzerland" },
        { "AUT", "Austria" },
        { "SWE", "Sweden" },
        { "NOR", "Norway" },
        { "DNK", "Denmark" },
        { "IRL", "Ireland" },
        { "PRT", "Portugal" },
        { "GRC", "Greece" },
        { "CZE", "Czech Republic" },
        { "ROU", "Romania" },
        { "HUN", "Hungary" },
        { "BGR", "Bulgaria" },
        { "SRB", "Serbia" },
        { "HRV", "Croatia" },
        { "SVK", "Slovakia" },
        { "SVN", "Slovenia" },
        { "FIN", "Finland" },
        // Add more as needed
    };
    
    [HttpGet("by-country")]
    public IActionResult GetManuscriptsByCountry([FromQuery] string country)
    {
        if (string.IsNullOrWhiteSpace(country))
            return BadRequest("Missing country code.");

        if (!IsoToCountryName.TryGetValue(country.ToUpper(), out var countryName))
            return NotFound("Unsupported country code.");

        var manuscripts = _context.Manuscripts
            .Where(m => m.Spatial != null && m.Spatial.ToLower() == countryName.ToLower())
            .Select(m => new
            {
                id = m.RecordIdentifier,
                title = m.Title,
                date = m.Date,
                language = m.Language
            })
            .ToList();

        return Ok(manuscripts);
    }

}