using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("ASSET_INVENTORY_FILE")]
    public class AssetInventoryFile
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        [StringLength(maximumLength: 100)]
        public string FileCode { get; set; }
        [StringLength(maximumLength: 100)]
        public string TicketCode { get; set; }
        [StringLength(maximumLength: 100)]
        public string FileName { get; set; }


    }



}
