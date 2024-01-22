using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("PROJECT_PRODUCT")]
    public class ProjectProduct
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]

        public int Id { get; set; }

        [StringLength(100)]
        public string ProductCode { get; set; }

        [DataType("decimal(18,2)")]
        public decimal? Quantity { get; set; }

        [StringLength(255)]
        public string Unit { get; set; }

        [StringLength(255)]
        public string ProjectCode { get; set; }

        [Required]
        [Range(0, double.MaxValue, ErrorMessage = "Please enter input cost greater than 0")]
        public decimal Cost { get; set; }

        public double Tax { get; set; }

        public double? Commission { get; set; }

        public double? CustomFee { get; set; }

        public double? Discount { get; set; }

        public string PriceType { get; set; }

        [StringLength(50)]
        public string ProductType { get; set; }

        public decimal? QuantityNeedExport { get; set; }

        public string Note { get; set; }
        public string PortType { get; set; }

        public string StatusObjectLog
        {
            get
            {
                return JsonConvert.SerializeObject(ListStatusObjectLog);
            }
            set
            {
                ListStatusObjectLog = string.IsNullOrEmpty(value)
                    ? new List<JsonLog>()
                    : JsonConvert.DeserializeObject<List<JsonLog>>(value);
            }
        }

        [NotMapped]
        public List<JsonLog> ListStatusObjectLog { get; set; }
    }
}
