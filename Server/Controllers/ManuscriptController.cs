using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[Route("api/[controller]")]
[ApiController]
public class ManuscriptsController : ControllerBase
{
    private readonly MyContext _context;

    public ManuscriptsController(MyContext context)
    {
        _context = context;
    }

    // GET: api/Manuscripts
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Manuscript>>> GetManuscripts()
    {
        return await _context.Manuscripts.ToListAsync();
    }

    // GET: api/Manuscripts/BYVANCK:3477
    [HttpGet("{id}")]
    public async Task<ActionResult<Manuscript>> GetManuscript(string id)
    {
        var manuscript = await _context.Manuscripts.FindAsync(id);

        if (manuscript == null)
        {
            return NotFound();
        }

        return manuscript;
    }



    // Endpoint to get verluchtingen by IsPartOf identifier
    [HttpGet("GetByIdentifier/{identifier}")]
public async Task<IActionResult> GetByIdentifier(string identifier)
{
    // Retrieve all verluchtingen from the database
    var verluchtingen = await _context.Verluchtingen.ToListAsync();

    // Filter the results on the client side using LINQ
    var filteredVerluchtingen = verluchtingen
        .Where(v => v.IsPartOf.Split(new[] { ';' })
            .Any(part => part.Trim().Contains(identifier)))
        .ToList();

    if (filteredVerluchtingen == null || !filteredVerluchtingen.Any())
    {
        return NotFound($"No verluchtingen found for identifier: {identifier}");
    }

    return Ok(filteredVerluchtingen);
}

}

