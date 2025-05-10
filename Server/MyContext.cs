using Microsoft.EntityFrameworkCore;

public class MyContext : DbContext{

    protected override void OnConfiguring( DbContextOptionsBuilder b ) => b.UseSqlite("Data Source=Medieval_Manuscripts.db");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }

    public DbSet<Manuscript> Manuscripts { get; set;}
    public DbSet<Verluchting> Verluchtingen { get; set;}



}