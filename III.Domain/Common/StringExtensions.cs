using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

namespace III.Domain.Common
{
    public static class StringExtensions
    {
        public static string ToSnakeCase(this string input, bool isUpper = false)
        {
            if (string.IsNullOrEmpty(input)) { return input; }

            var startUnderscores = Regex.Match(input, @"^_+");

            return isUpper ? startUnderscores + Regex.Replace(input, @"([a-z0-9])([A-Z])", "$1_$2").ToUpper()
                           : startUnderscores + Regex.Replace(input, @"([a-z0-9])([A-Z])", "$1_$2").ToLower();
        }
        public interface IEntity<TId>
        {
            TId Id { get; set; }
        }
        public static IQueryable<IEntity<int>> Set (this DbContext context, Type t)
        {
            return (IQueryable<IEntity<int>>)context.GetType().GetMethod("Set")?.MakeGenericMethod(t).Invoke(context, null);
        }
    }
    public static class ListIntHelper
    {
        public static IEnumerable<IEnumerable<int>> GroupConsecutive(this List<int> list)
        {
            var group = new List<int>();
            foreach (var i in list)
            {
                if (group.Count == 0 || i - group[group.Count - 1] <= 1)
                    group.Add(i);
                else
                {
                    yield return group;
                    group = new List<int> { i };
                }
            }
            yield return group;
        }
        public static bool ContainsRange(this List<int> a, List<int> b)
        {
            return !b.Except(a).Any();
        }
    }
    //public static class ListHelper<T>
    //{
    //    public static bool ContainsRange(this List<T> a, List<T> b)
    //    {
    //        return !b.Except(a).Any();
    //    }
    //}
}
