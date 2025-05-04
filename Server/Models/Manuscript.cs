using System.ComponentModel.DataAnnotations;

public class Manuscript{
    [Key]
    public string RecordIdentifier { get; set; } // BYVANCK ID
    public string Identifier { get; set; } // KB Shelfmark
    public string BibliographicCitation { get; set; } 
    public string Title { get; set; } 
    public string Creator { get; set; } 
    public string Contributors { get; set; } 
    public string Provenance { get; set; } 
    public string Description { get; set; } 
    public string Annotation { get; set; } 
    public string Spatial { get; set; } 

    public string Date { get; set; } 
    public string Language { get; set; }  
    public string Medium { get; set; } // materials
    public string Format { get; set; } // Pages
    public string Extent { get; set; }   
    public string Columns { get; set; } // extend ,  xsi-type = columns
    public string Lines { get; set; } //  extend , xsi-type = lines
    public string BindingDescription { get; set; } // desciption dcx label = edge
}