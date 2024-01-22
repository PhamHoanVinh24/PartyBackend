using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("V_HIGHCHART_FUND")]
    public class VHighchartFund
    {
        [Key]
        public Guid Id { get; set; }
        public int? Month { get; set; }
        public string Name { get; set; }
        public decimal? Total { get; set; }
    }
}
