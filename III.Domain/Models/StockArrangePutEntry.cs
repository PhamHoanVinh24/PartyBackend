using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("STOCK_ARRANGE_PUT_ENTRY")]
    public class StockArrangePutEntry
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        public int MapId { get; set; }
        public decimal? Quantity { get; set; }
        public string ProdCode { get; set; }
        public bool MarkWholeProduct { get; set; }
    }
}
