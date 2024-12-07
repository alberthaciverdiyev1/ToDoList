using System.Diagnostics;
using System.Reflection.Metadata;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToDoList.DAL;
using ToDoList.Models;
using File = ToDoList.Models.File;

namespace ToDoList.Controllers;

public class HomeController : Controller
{
    private readonly AppDbContext _context;

    public HomeController(AppDbContext context)
    {
        _context = context;
    }
    public IActionResult Index()
    {
        return View();
    }
    public async Task<IActionResult> GetAll()
    {
        List<Models.File> list = await _context.Files.ToListAsync();
        return View(list);
    }

    [HttpPost]
    public async Task<IActionResult> Create(IFormFile file, string name, string description)
    {
        if (file == null || file.Length == 0)
            return BadRequest("File is empty");

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream);

        File insertData = new File
        {
            Name = name,
            Description = description,
            Type = file.ContentType,
            Document = memoryStream.ToArray()
        };

        await _context.AddAsync(insertData);
        await _context.SaveChangesAsync();

        return Ok("File uploaded successfully");
    }

    //public async Task<IActionResult>(Files data)
    //{

    //}


}