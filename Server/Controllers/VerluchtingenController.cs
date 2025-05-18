using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using System.Collections.Generic;

[ApiController]
[Route("api/[controller]")]
public class VerluchtingenController : ControllerBase
{
    private readonly MyContext _context;

    public VerluchtingenController(MyContext context)
    {
        _context = context;
    }

    [HttpGet("bymanuscript/{manuscriptId}")]
    public async Task<ActionResult<IEnumerable<Verluchting>>> GetVerluchtingenByManuscript(string manuscriptId)
    {
        var verluchtingen = await _context.Verluchtingen
            .Where(v => v.IsPartOf == manuscriptId)
            .ToListAsync();

        return verluchtingen;
    }
}
