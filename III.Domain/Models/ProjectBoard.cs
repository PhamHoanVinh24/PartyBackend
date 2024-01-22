using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace ESEIM.Models
{
    [Table("PROJECT_BOARD")]
    public class ProjectBoard
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(50)]
        public string ProjectCode { get; set; }

        [StringLength(50)]
        public string BoardCode { get; set; }
    }
}
