using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_LIQUIDATION_FILE")]
    public class AssetLiquidationFile
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }

        [StringLength(100)]
        public string FileCode { get; set; }

        [StringLength(100)]
        public string FileName { get; set; }

        [StringLength(100)]
        public string TicketCode { get; set; }
    }
}
