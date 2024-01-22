using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using Microsoft.EntityFrameworkCore.Internal;
using Newtonsoft.Json;

namespace ESEIM.Models
{
    [Table("USER_WISH_LIST_SUBJECT")]
    public class UserWishListSubject
    {
     [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        public string UserName { get; set; }
        [NotMapped]
        public List<string> ListWishListSubject { get; set; }

        public string SubjectList
        {
            get => ListWishListSubject.Join(",");
            set =>
                ListWishListSubject = string.IsNullOrEmpty(value)
                    ? new List<string>()
                    : value.Split(",").ToList();
        }
        public string CreatedBy { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public bool IsDeleted {get; set;}
        public string DeletedBy { get; set; }
        public DateTime? DeletedTime { get; set; }
    }
}
