using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("V_AMCHART_COUNT_SUPPLIER")]
    public class VAmchartCountSupplier
    {
        [Key]
        public Guid Id { get; set; }
        public int? Month { get; set; }
        public int? Income { get; set; }
        [NotMapped]
        public decimal? Total { get; set; }
    }
}
