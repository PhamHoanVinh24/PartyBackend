using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PRODUCT_QUALITY_INSPECTION_IMP_DETAILS")]
    public class ProductQualityInspectionImpDetails
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string QcTicketCode { get; set; }


        public string ProdCodeLst { get; set; }

        public DateTime? ReceivedDate { get; set; }

        public DateTime? CheckingDate { get; set; }

        [StringLength(255)]
        public string SupplierCode { get; set; }

        [StringLength(255)]
        public string DeliveryNo { get; set; }

        [StringLength(255)]
        public string FacilitySpect { get; set; }

        [StringLength(255)]
        public string Quantity { get; set; }

        [StringLength(255)]
        public string Unit { get; set; }

        [StringLength(255)]
        public string Results { get; set; }

        [StringLength(255)]
        public string Content { get; set; }
    }
}
