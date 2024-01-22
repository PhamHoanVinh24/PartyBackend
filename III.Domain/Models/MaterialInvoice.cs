using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("MATERIAL_INVOICE")]
    public class MaterialInvoice
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(50)]
        public string Code { get; set; }

        [StringLength(250)]
        public string Title { get; set; }

        public double? TotalPay { get; set; }

        [StringLength(100)]
        public string Currency { get; set; }

        public int? Type { get; set; }

        [StringLength(500)]
        public string Note { get; set; }

        public int? ContractId { get; set; }

        public int? Reason { get; set; }

        public DateTime? CreatedTime { get; set; }
    }
}
