using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ToDoList.Models;

public class FileUploadModel
{
    [Required]
    public int Id { get; set; } 

    public string? Name { get; set; }
    [Required]
    public string? Description { get; set; }
    [NotMapped]
    public IFormFile? File { get; set; }
    public byte[]? Document { get; set; }
    public string? Type { get; set; }

    [Required]
    public DateTime? CreatedAt { get; set; } = DateTime.Now;
    public DateTime? LastModified { get; set; }
    public DateTime? DeletedAt { get; set; }

}