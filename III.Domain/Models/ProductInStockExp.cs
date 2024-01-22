using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("PRODUCT_IN_STOCK_EXP")]
    public class ProductInStockExp
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string TicketCode { get; set; }

        [StringLength(100)]
        public string ProductCode { get; set; }

        [StringLength(50)]
        public string ProductType { get; set; }

        [StringLength(100)]
        public string ProductQrCode { get; set; }

        public decimal Quantity { get; set; }

        [StringLength(255)]
        public string RackCode { get; set; }

        [StringLength(255)]
        public string ProductCoil { get; set; }
    }
}
