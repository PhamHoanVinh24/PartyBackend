using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("V_AMCHART_COUNT_BUY")]
    public class VAmchartCountBuy
    {
        [Key]
        public Guid Id { get; set; }
        public int? Month { get; set; }
        public int? Income { get; set; }
        public decimal? Total { get; set; }
    }

    public class PChartModel
    {
        public string Status { get; set; }
        public string Country { get; set; }
        public int? Litres { get; set; }
        public decimal? Value { get; set; }
        public string CatCode { get; set; }
        public string CatName { get; set; }
        public int? Month { get; set; }
        public int? Year { get; set; }
        public string Name { get; set; }
        public double? PercentData { get; set; }
        public int? Quantity { get; set; }
    }
}
