using Microsoft.EntityFrameworkCore;
using ToDoList.Models;


namespace ToDoList.DAL
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        public DbSet<FileUploadModel> Files { get; set; }
    }
}
