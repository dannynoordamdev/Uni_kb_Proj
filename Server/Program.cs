var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Setup CORS 
builder.Services.AddCors(options =>{

    options.AddPolicy("AllowReactApp", policy => {
        // react running on port:
        policy.WithOrigins("http://localhost:8110")
        .AllowAnyHeader()
        .AllowAnyMethod();
    
    });
});

app.UseCors("AllowReactApp");


app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

// Asp.net core running on port:
app.Run("http://localhost:8111");