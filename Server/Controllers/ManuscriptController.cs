using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
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

}