using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_RECALLED_FILE")]
    public class AssetRecalledFile
    {
        public int ID { get; set; }
        public string FileCode { get; set; }
        public string FileName { get; set; }
        public string TicketCode { get; set; }
    }
}
