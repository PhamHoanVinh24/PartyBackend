using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;

namespace ESEIM.Models
{

    [Table("ITEM_PACK_USER")]
    public class ItemPackUser 
    {
        public ItemPackUser()
        {
            ListItemPack = new List<PackItem>();
        }
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        public string UserName { get; set; }
        public string ItemPack
        {
            get => JsonConvert.SerializeObject(ListItemPack);
            set =>
                ListItemPack = string.IsNullOrEmpty(value)
                    ? new List<PackItem>()
                    : JsonConvert.DeserializeObject<List<PackItem>>(value);
        }
        [NotMapped]
        public List<PackItem> ListItemPack { get; set; }

        [StringLength(50)]
        public string CreateBy { get; set; }

        public DateTime? CreateTime { get; set; }

        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        public bool IsDeleted { get; set; }
    }

    public class PackItem
    {
        public string ItemType { get; set; }

        public string ItemCode { get; set; }

        public string Status { get; set; }

        public decimal? Price { get; set; }
        
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }
    }
}
