using System.ComponentModel.DataAnnotations;

public class Verluchting
{
    [Key]
    public string RecordIdentifier { get; set; }
    public int RecordPosition { get; set; }
    public string Creator { get; set; }
    public string HasPart { get; set; }
    public string Thumbnail { get; set; }
    public string Subject { get; set; }
    public string Folio {get; set; } // [0] of the extent
    public string Dimension { get; set; } // [1] of the extent
    public string Title { get; set; }
    public string IsPartOf { get; set; }
    public string Relation { get; set; }
    public string Spatial { get; set; }
    public string Identifier { get; set; } // image of the object
    public string Date { get; set; }
    public string Type { get; set; }
    public string Illustration { get; set; } // image of the pages

}
