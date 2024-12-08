using System.Diagnostics;
using System.Reflection.Metadata;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToDoList.DAL;
using ToDoList.Models;
using FileUploadModel = ToDoList.Models.FileUploadModel;

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
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        List<FileUploadModel> list = await _context.Files.Where(x => x.DeletedAt == null).ToListAsync();

        return Ok(list);
    }
    [HttpPost]
    //[ValidateAntiForgeryToken]
    public async Task<IActionResult> Create([FromForm] FileUploadModel model)
    {
        //if (model.Doc == null || model.Doc.Length == 0)
        //    return BadRequest("The uploaded file is empty or not provided.");

        using var memoryStream = new MemoryStream();
        await model.File.CopyToAsync(memoryStream);

        var newFile = new FileUploadModel
        {
            Name = model.Name, 
            Description = model.Description, 
            Type = model.File.ContentType,
            Document = memoryStream.ToArray() 
        };

        await _context.Files.AddAsync(newFile);
        await _context.SaveChangesAsync();

        return Ok("File uploaded successfully");
    }



}