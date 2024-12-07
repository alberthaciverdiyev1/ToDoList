using System.ComponentModel.DataAnnotations;

namespace ToDoList.Models;

public class File
{
    [Required]
    public string? Name { get; set; }
    [Required]
    public string? Description { get; set; }
    [Required]
    public byte[]? Document { get; set; }
    public string? Type { get; set; }

    [Required]
    public DateTime? CreatedAt { get; set; } = DateTime.Now;
    public DateTime? LastModified { get; set; }
    public DateTime? DeletedAt { get; set; }

}