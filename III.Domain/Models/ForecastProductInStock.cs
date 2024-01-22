using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("FORECAST_PRODUCT_IN_STOCK")]
    public class ForecastProductInStock
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string ProductCode { get; set; }

        public int? CntProductInStock { get; set; }
        public int? CntForecast { get; set; }
        public int? Cnt { get; set; }

        public DateTime? ForecastDate { get; set; }

        [StringLength(255)]
        public string ProductType { get; set; }
    }
}
