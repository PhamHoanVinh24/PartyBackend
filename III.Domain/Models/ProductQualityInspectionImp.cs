using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PRODUCT_QUALITY_INSPECTION_IMP")]
    public class ProductQualityInspectionImp
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string QcTicketCode { get; set; }

        [StringLength(255)]
        public string TicketTitle { get; set; }

        [StringLength(255)]
        public string TicketCreator { get; set; }

        public DateTime? TicketCreateTime { get; set; }

        [StringLength(255)]
        public string Status { get; set; }

        [StringLength(100)]
        public string Excuter { get; set; }

        [StringLength(255)]
        public string Checker { get; set; }

        [StringLength(255)]
        public string Noted { get; set; }
    }
}
