using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using III.Domain.Common;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("PRODUCT_LOCATED_MAPPING_LOG")]
    public class ProductLocatedMappingLog
    {
        public ProductLocatedMappingLog()
        {

        }
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int? IdImpProduct { get; set; }
        public int? IdLocMapOld { get; set; }
        public int? IdLocatedMapping { get; set; }

        public string StoreCode { get; set; }
        public string MappingCode { get; set; }
        public string MappingCodeOld { get; set; }

        [StringLength(255)]
        public string ProductQrCode { get; set; }

        public string ProductCode { get; set; }
        public string GattrCode { get; set; }

        public string TicketCode { get; set; }
        public string Type { get; set; }
        public string ProductNo { get; set; }

        public bool IsDeleted { get; set; }

        [StringLength(50)]
        public string DeletionToken { get; set; }

        public decimal? Quantity { get; set; }
        [StringLength(50)]
        public string Unit { get; set; }

        [StringLength(maximumLength: 50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(maximumLength: 50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }
    }
}
