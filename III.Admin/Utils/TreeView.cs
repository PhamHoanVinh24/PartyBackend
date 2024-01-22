using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ESEIM.Utils
{
    public class TreeView
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Title { get; set; }
        public int? ParentId { get; set; }
        public int? Order { get; set; }
        public bool HasChild { get; set; }
        public int Level { get; set; }
        public string ParentCode { get; set; }
    }
    public class TreeViewEx:TreeView
    {
        public string Image { get; set; }
    }
    public class TreeViewString
    {
        public string Id { get; set; }
        public string Code { get; set; }
        public string Title { get; set; }
        public int? ParentId { get; set; }
        public string ParentCode { get; set; }
        public int? Order { get; set; }
        public bool HasChild { get; set; }
        public int Level { get; set; }
    }
    public class TreeViewResource
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Title { get; set; }
        public string TitleJoin { get; set; }
        public int? ParentId { get; set; }
        public string ParentCode { get; set; }
        public int? Order { get; set; }
        public bool HasChild { get; set; }
        public string Path { get; set; }
        public string Api { get; set; }
        public string Description { set; get; }
        public bool Status { get; set; }
        public int? Level { get; set; }
        public List<string> ListRepository { get; set; }
        public string TypeRepos { get; set; }
        public string CateRepoSettingId { get; set; }
    }

    public class TreeViewExString
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Title { get; set; }
        public string ParentId { get; set; }
        public int? Order { get; set; }
        public bool HasChild { get; set; }
        public int Level { get; set; }
    }
}
