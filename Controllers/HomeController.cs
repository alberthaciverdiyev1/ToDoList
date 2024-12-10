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
        List<FileUploadModel> list = await _context.Files.Where(x => x.DeletedAt == null).OrderByDescending(x=>x.Id).ToListAsync();

        return Ok(list);
    }
    [HttpGet]
    public async Task<IActionResult> GetTrashedList()
    {
        List<FileUploadModel> list = await _context.Files.Where(x => x.DeletedAt != null).OrderByDescending(x => x.Id).ToListAsync();

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

    [HttpPost]
    public async Task<IActionResult> Delete(int id)
    {
        var file = await _context.Files.FindAsync(id);
        if (file == null)
        {
            return NotFound("File not found.");
        }

        file.DeletedAt = DateTime.UtcNow; 
        _context.Files.Update(file);
        await _context.SaveChangesAsync();

        return Ok("File marked as deleted successfully.");
    }

    [HttpPost]
    public async Task<IActionResult> HardDelete(int id)
    {
        var file = await _context.Files.FindAsync(id);
        if (file == null)
        {
            return NotFound("File not found.");
        }

        _context.Files.Remove(file);
        await _context.SaveChangesAsync();

        return Ok("File deleted successfully.");
    }


    [HttpPost]
    public async Task<IActionResult> Update([FromForm] FileUploadModel model)
    {
        var file = await _context.Files.FindAsync(model.Id);
        if (file == null)
        {
            return NotFound("File not found.");
        }

        file.Name = model.Name;
        file.Description = model.Description;

        if (model.File != null)
        {
            using var memoryStream = new MemoryStream();
            await model.File.CopyToAsync(memoryStream);
            file.Document = memoryStream.ToArray();
            file.Type = model.File.ContentType;

        }
            file.LastModified = DateTime.UtcNow;

        _context.Files.Update(file);
        await _context.SaveChangesAsync();

        return Ok("File updated successfully.");
    }



}