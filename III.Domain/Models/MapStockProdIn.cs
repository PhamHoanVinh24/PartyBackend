using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("MAP_STOCK_PROD_IN")]
    public class MapStockProdIn
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        public int MapId { get; set; }
        public decimal? Quantity { get; set; }
        public string ProdCode { get; set; }
        public string Unit { get; set; }
        public bool IsDeleted { get; set; }
        public int? ParentId { get; set; }
    }
}
