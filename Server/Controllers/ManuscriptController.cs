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

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Manuscript>>> GetManuscripts()
    {
        return await _context.Manuscripts.ToListAsync();
    }

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



    [HttpGet("GetByIdentifier/{identifier}")]
public async Task<IActionResult> GetByIdentifier(string identifier)
{
    var verluchtingen = await _context.Verluchtingen.ToListAsync();

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

