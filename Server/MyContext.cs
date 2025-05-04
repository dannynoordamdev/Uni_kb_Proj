using Microsoft.EntityFrameworkCore;

public class MyContext : DbContext{

    protected override void OnConfiguring( DbContextOptionsBuilder b ) => b.UseSqlite("Data Source=Medieval_Manuscripts.db");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }

    // This sets up our tables inside the DB.
    public DbSet<Manuscript> Manuscripts { get; set;}
    public DbSet<Verluchtiging> Verluchtigingen {get;set;}



}