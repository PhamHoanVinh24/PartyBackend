using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("PROJECT_SERVICE")]
    public class ProjectService
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string ServiceCode { get; set; }

        [DataType("decimal(18,2)")]
        public decimal? Quantity { get; set; }

        [StringLength(255)]
        public string Unit { get; set; }

        [StringLength(255)]
        public string Level { get; set; }

        [StringLength(255)]
        public string DurationTime { get; set; }

        [StringLength(255)]
        public string Status { get; set; }

        [StringLength(255)]
        public string Note { get; set; }

        [StringLength(255)]
        public string ProjectCode { get; set; }
    }
}
