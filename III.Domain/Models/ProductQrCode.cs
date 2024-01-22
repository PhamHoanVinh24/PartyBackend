using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PRODUCT_QR_CODE")]
    public class ProductQrCode
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string ProductCode { get;set; }

        [StringLength(255)]
        public string LotCode { get; set; }

        [StringLength(50)]
        public string ImpCode { get; set; }

        [StringLength(50)]
        public int Count { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }
        public string QrCode { get; set; }

        public string JsonLog {
            get
            {
                return JsonConvert.SerializeObject(ListLog);
            }
            set
            {
                ListLog = string.IsNullOrEmpty(value)
                ? new List<JsonLog>()
                : JsonConvert.DeserializeObject<List<JsonLog>>(value);
            }
        }

        [NotMapped]
        public List<JsonLog> ListLog { get; set; }

        public bool Enable { get; set; }
    }
}
