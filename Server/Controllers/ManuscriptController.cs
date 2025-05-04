using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class ManuscriptsController : ControllerBase
{
    private readonly MyContext _context;

    public ManuscriptsController(MyContext context)
    {
        _context = context;
    }

    [HttpGet("{recordId}/illustrations")]
    public async Task<IActionResult> GetIllustrationsForManuscript(string recordId)
    {
        var manuscript = await _context.Manuscripts
            .FirstOrDefaultAsync(m => m.RecordIdentifier == recordId);

        if (manuscript == null)
        {
            return NotFound();
        }

        var verluchtingen = await _context.Verluchtingen
            .Where(i => i.RecordIdentifier == recordId)
            .ToListAsync();

        return Ok(verluchtingen);
    }

    [HttpGet("manuscripts/sample")]
public async Task<IActionResult> GetSampleManuscripts()
{
    var data = await _context.Manuscripts.Take(10).ToListAsync();
    return Ok(data);
}

[HttpGet("illustrations/sample")]
public async Task<IActionResult> GetSampleIllustrations()
{
    var data = await _context.Verluchtingen.Take(10).ToListAsync();
    return Ok(data);
}

}
